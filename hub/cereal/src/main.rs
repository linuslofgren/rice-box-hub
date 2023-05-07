use std::env;
use std::io::{self, BufReader, Write};
use std::str;
use std::time::Duration;

fn main() {
    // the port is passed using `cargo run -- <port_name>`
    let port_name = env::args().skip(1).next().unwrap();
    let baud_rate = 9600;

    let port = serialport::new(port_name.clone(), baud_rate)
        .timeout(Duration::from_millis(100))
        .open()
        .expect("Failed to open serial port");

    let client = redis::Client::open("redis://redis/")
        .expect("Failed to open redis client");
    let mut conn = client.get_connection()
        .expect("Failed to connect to redis client");
    let mut pubsub = conn.as_pubsub();
    pubsub.subscribe("ris_position")
        .expect("Failed to subscribe to channel");

    let mut port = BufReader::new(port);

    loop {
        let input : String = pubsub.get_message()
            .expect("Failed to get message")
            .get_payload()
            .expect("Failed to get payload");

        // send the input to the Arduino
        let mut buf: Vec<u8> = input.into();
        buf.push(b'\n'); // add a newline character to the end of the input
        port.get_mut().write_all(&buf).expect("Failed to write to serial port");

        // read the response from the Arduino
        let mut serial_buf: Vec<u8> = vec![0; 1000];
        println!("Receiving data on {} at {} baud:", &port_name, &baud_rate);
        loop {
            match port.get_mut().read(serial_buf.as_mut_slice()) {
                Ok(t) => {
                    let result = str::from_utf8(&serial_buf[..t]).unwrap();
                    // io::stdout().write_all(&serial_buf[..t]).unwrap()
                    print!("{}", result);
                    if result.chars().last().unwrap() == '\n' {
                        println!("breaking");
                        break;
                    }
                },
                Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                Err(e) => eprintln!("{:?}", e),
            }
        }
    }
}
