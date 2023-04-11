struct Vec2{T}
    x::T
    y::T
end

struct Surface
    wavelength::Float64
    length::Float64
    num_elements::Int64
    element_width::Float64

    function Surface(wavelength::Float64, length::Float64, num_elements::Int64)
        element_width = length / Float64(num_elements)
        new(wavelength, length, num_elements, element_width)
    end
end

struct ObjectPositions
    ris::Vec2{Float64}
    rx::Vec2{Float64}
    tx::Vec2{Float64}

    function ObjectPositions(pos::Dict{String, Dict{String, Float64}})
        try
            ris = Vec2(pos["ris"]["x"], pos["ris"]["y"])
            rx = Vec2(pos["rx"]["x"], pos["rx"]["y"])
            tx = Vec2(pos["tx"]["x"], pos["tx"]["y"])
            new(ris, rx, tx)
        catch
            throw(ArgumentError)
        end
    end
end