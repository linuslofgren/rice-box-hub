using JSON
using Sockets

include("positioning_functions.jl")
include("types.jl")


const WAVELENGTH = 0.12 # meters
const RIS_LENGTH = 0.3 # meters
const RIS_NUM_ELEMENTS = 10
const RIS = Surface(WAVELENGTH, RIS_LENGTH, RIS_NUM_ELEMENTS)

const OPERATIONS = Dict(
        "angle" => angle,
        "couple" => couple,
        "focus" => focus
    )


function get_configuration(data::Dict{String, Any})
    # Request will be of type `Operation` (in hub/server/types.ts)
    # The first key determines type of operation
    op_type = first(data)[1]
    func = OPERATIONS[op_type]

    # Pluck the value from the first key
    value = first(data)[2]

    if op_type == "angle"
        value = convert(Float64, value)
        return func(RIS, value)
    else # couple or focus
        value = convert(Dict{String, Dict{String, Float64}}, value)
        positions = ObjectPositions(value)
        return func(RIS, positions)
    end
end


function handle_request(conn)
    while isopen(conn) && !eof(conn)
        try
            # Need readline to make eof check work (don't know why)
            msg = readline(conn)
            println("Message from socket: ", msg)
            data = JSON.parse(msg)

            response = "{}"
            res_data = get_configuration(data)
            response = Dict("configuration" => res_data)
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
