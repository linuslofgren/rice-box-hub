include("types.jl")


function angle(
        RIS::Surface,
        angle::Float64
    )

    throw("unimplemented")
end


function couple(RIS::Surface, positions::ObjectPositions)
    return couple(RIS, positions.ris, positions.rx, positions.tx)
end


"""
    couple(
        RIS::Surface,
        RIS_pos::Vec2{Float64},
        rx::Vec2{Float64},
        tx::Vec2{Float64}
    )

Returns the element displacements needed to couple the transmitter (at `tx`) and receiver
(at `rx`).
"""
function couple(
        RIS::Surface,
        RIS_pos::Vec2{Float64},
        rx::Vec2{Float64},
        tx::Vec2{Float64}
    )

    theta_i, theta_r = _calc_angles(RIS_pos, rx, tx)

    # endpoints for element mid positions
    x0 = -RIS.length + 0.5*RIS.element_width
    x1 = -x0

    element_positions = LinRange(x0, x1, RIS.num_elements)
    phaseshifts = map(x -> _phaseshift(x, theta_i, theta_r, RIS.wavelength), element_positions)

    return collect(map(x -> _displacement_from_phaseshift(x, RIS.wavelength), phaseshifts))
end


function focus(
        RIS::Surface,
        RIS_pos::Vec2{Float64},
        rx::Vec2{Float64},
        tx::Vec2{Float64}
    )

    throw("unimplemented")
end


"""
    _calc_angles(RIS_pos::Vec2{Float64}, rx::Vec2{Float64}, tx::Vec2{Float64})

Calculates the angles between the surface normal of the RIS (at `RIS_pos`) and the transmitter
(at `tx`) and the receiver (at `rx`) respectively.
"""
function _calc_angles(RIS_pos::Vec2{Float64}, rx::Vec2{Float64}, tx::Vec2{Float64})
    incident_angle = pi/2 - atan(tx.y-RIS_pos.y, tx.x-RIS_pos.x)
    reflection_angle = pi/2 - atan(rx.y-RIS_pos.y, rx.x-RIS_pos.x)

    return incident_angle, reflection_angle
end


"""
    _phaseshift(x::Float64, theta_i::Float64, theta_r::Float64, wavelength::Float64)

Calculates the phaseshift needed at position `x` to redirect a plane wave incident at angle
`theta_i` from the surface normal to reflect in the direction `theta_r`.
"""
function _phaseshift(x::Float64, theta_i::Float64, theta_r::Float64, wavelength::Float64)
    return 2pi/wavelength * x * (sin(theta_i)+sin(theta_r))
end


"""
    _displacement_from_phaseshift(phaseshift::Float64, wavelength::Float64)

Calculates the element displacement necessary to induce the desired `phaseshift`.
"""
function _displacement_from_phaseshift(phaseshift::Float64, wavelength::Float64)
    return mod((phaseshift*wavelength/2pi), (wavelength/2))
end
