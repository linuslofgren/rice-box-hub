using JSON
using Sockets

include("ElementDisplacing.jl")
include("types.jl")


function get_displacements(input::Dict{String, Dict{String, Float64}})
    ris = Surface(0.12, 0.3, 10)
    ris_pos = Vec2(input["ris"]["x"], input["ris"]["y"])
    rx = Vec2(input["rx"]["x"], input["rx"]["y"])
    tx = Vec2(input["tx"]["x"], input["tx"]["y"])

    return ElementDisplacing.couple(ris, ris_pos, rx, tx)
end


function handle_request(conn)
    while isopen(conn) && !eof(conn)
        try
            # Need readline to make eof check work (don't know why)
            msg = readline(conn)
            println("Message from socket: ", msg)
            data = JSON.parse(msg)

            response = "{}"

            # Test the shape of the request to determine algorithm
            # Request will be of type `Operation` (in hub/server/types.ts)
            # TODO: Differentiate between `focus` and `couple`
            try
                # Test for Operations couple and focus
                req_data = convert(Dict{String, Dict{String, Dict{String, Float64}}}, data)
                # Pluck the value from the first key
                positions = first(req_data)[2]
                res_data = get_displacements(positions)
                response = Dict("displacement" => res_data)
            catch
            end
            # TODO: test for Operation angle
            
            write(conn, JSON.json(response))
        catch ex
            # handle any exceptions that occur during processing
            try
                @warn "Error handling client request: $ex"
                println("Exception caught")
                err_msg = sprint(showerror, ex, backtrace())
                response = Dict("error" => err_msg)
                resp_str = JSON.json(response)
                write(conn, resp_str)
            catch e2
                # The previous error handling can throw; catch these exceptions
                @warn "Error handling client request: $e2"
                write(conn, "{\"error\": \"Error in exception handler, this should NEVER happen.\"}")
            end
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
