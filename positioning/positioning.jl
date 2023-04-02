using JSON
using Sockets

include("ElementDisplacing.jl")


function get_displacements(input::Dict{String, Dict{String, Float64}})
    ris = ElementDisplacing.Surface(
        ElementDisplacing.Vec2(input["ris"]["x"], input["ris"]["y"]), 0.3, 10
    )
    rx = ElementDisplacing.Vec2(input["rx"]["x"], input["rx"]["y"])
    tx = ElementDisplacing.Vec2(input["tx"]["x"], input["tx"]["y"])

    return ElementDisplacing.couple_transmitter_receiver(ris, tx, rx, 0.12)
end


function handle_request(conn)
    while isopen(conn)
        println("handling request...")
        try
            req = JSON.parse(conn)
            req_data = convert(Dict{String, Dict{String, Float64}}, req)
            res_data = get_displacements(req_data)
            res = Dict("displacement" => res_data)
            JSON.print(conn, res)
            println("response sent")
        catch ex # TODO: exception handling
            println(ex)
        end
    end
end


function main()
    PIPE = "ris.sock"
    server = Sockets.listen(PIPE)
    println("listening...")

    while true
        conn = Sockets.accept(server)
        @async handle_request(conn)
    end
end


main()
