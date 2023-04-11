module ElementDisplacing

include("types.jl")

export angle, couple_transmitter_receiver, focus, Vec2, Surface


function angle(
        RIS::Surface,
        wavelength::Float64,
        angle::Float64
    )

    throw("unimplemented")
end


"""
    couple_transmitter_receiver(
        RIS::Surface,
        transmitter::Vec2{Float64},
        receiver::Vec2{Float64},
        wavelength::Float64
    )

Returns the element displacements needed to couple the `transmitter` and `receiver`.
"""
function couple_transmitter_receiver(
        RIS::Surface,
        transmitter::Vec2{Float64},
        receiver::Vec2{Float64},
        wavelength::Float64
    )

    theta_i, theta_r = _calc_angles(RIS, transmitter, receiver)

    # endpoints for element mid positions
    x0 = -RIS.length + 0.5*RIS.element_width
    x1 = -x0

    element_positions = LinRange(x0, x1, RIS.num_elements)
    phaseshifts = map(x -> _phaseshift(x, theta_i, theta_r, wavelength), element_positions)

    return collect(map(x -> _displacement_from_phaseshift(x, wavelength), phaseshifts))
end


function focus(
        RIS::Surface,
        transmitter::Vec2{Float64},
        receiver::Vec2{Float64},
        wavelength::Float64
    )

    throw("unimplemented")
end


"""
    _calc_angles(RIS::Surface, transmitter::Vec2{Float64}, receiver::Vec2{Float64})

Calculates the angles between the surface normal of the RIS and the transmitter and the
receiver respectively.
"""
function _calc_angles(RIS::Surface, transmitter::Vec2{Float64}, receiver::Vec2{Float64})
    incident_angle = pi/2 - atan(transmitter.y-RIS.position.y, transmitter.x-RIS.position.x)
    reflection_angle = pi/2 - atan(receiver.y-RIS.position.y, receiver.x-RIS.position.x)

    return incident_angle, reflection_angle
end


"""
    _phaseshift(x::Float64, theta_i::Float64, theta_r::Float64, wavelength::Float64)

Calculates the phaseshift needed at position `x` to redirect a plane wave incident at angle
`theta_i` from the surface normal to reflect in the direction `theta_r`.
"""
function _phaseshift(x::Float64, theta_i::Float64, theta_r::Float64, wavelength::Float64)
    return (2pi/wavelength * x * (sin(theta_i)+sin(theta_r))) #% (2pi)
end


"""
    _displacement_from_phaseshift(phaseshift::Float64, wavelength::Float64)

Calculates the element displacement nessecary to induce the desired `phaseshift`.
"""
function _displacement_from_phaseshift(phaseshift::Float64, wavelength::Float64)
    return (phaseshift*wavelength/2pi) % (wavelength/2)
end

end