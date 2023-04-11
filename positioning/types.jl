struct Vec2{T}
    x::T
    y::T
end

struct Surface
    position::Vec2{Float64}
    length::Float64
    num_elements::Int64
    element_width::Float64

    function Surface(position::Vec2{Float64}, length::Float64, num_elements::Int64)
        element_width = length / Float64(num_elements)
        new(position, length, num_elements, element_width)
    end
end
