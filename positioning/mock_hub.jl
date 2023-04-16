using Sockets
using JSON


function main()
    PIPE = "ris.sock"

    socket = Sockets.connect(PIPE)

    couple_data = Dict(
        "couple" => Dict(
            "ris" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                ),
            "rx" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                ),
            "tx" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                )
        )
    )

    focus_data = Dict(
        "couple" => Dict(
            "ris" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                ),
            "rx" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                ),
            "tx" => Dict(
                    "x" => 1.0,
                    "y" => 2.0
                )
        )
    )

    angle_data = Dict(
        "angle" => 45.0
    )

    println(socket, JSON.json(couple_data))
    res1 = JSON.parse(socket)

    println(socket, JSON.json(focus_data))
    res2 = JSON.parse(socket)

    println(socket, JSON.json(angle_data))
    res3= JSON.parse(socket)

    println(res1, res2, res3)
end


main()
