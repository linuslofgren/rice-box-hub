use std::env;
use std::io::{self, BufReader, Write};
use std::str;
use std::time::Duration;
use redis::Commands;
use serialport::SerialPort;
use std::time::{SystemTime, UNIX_EPOCH};

mod choose_usb_port;
mod main_mock;

fn main() {
    // the port is passed using `cargo run -- <port_name>`
    let baud_rate = 9600;
    let port_name_arg = env::args().skip(1).next();
    let port_name: String;

    match port_name_arg {
      Some(name) => {
        if name.eq("mock") {
            println!("Entering mock");
            main_mock::main();
            return;    
        }
        port_name = name
      },
      None => port_name = choose_usb_port::choose_usb_port().unwrap().port_name
    }

    print!("Attempting to open {} ... ", port_name);

    let port = serialport::new(port_name.clone(), baud_rate)
        .timeout(Duration::from_millis(100))
        .open()
        .expect("Failed to open serial port");
    println!("Port open!");

    let sub_client = redis::Client::open("redis://localhost:6378/")
        .expect("Failed to open redis client");
    let mut pub_client = redis::Client::open("redis://localhost:6378/")
        .expect("Failed to open redis client").get_connection().expect("Failed to get pub connection");
    let mut conn = sub_client.get_connection()
        .expect("Failed to connect to redis client");
    let mut pubsub = conn.as_pubsub();
    pubsub.subscribe("ris_position")
        .expect("Failed to subscribe to channel");

    println!("Listening to Redis.");
    
    let mut port = BufReader::new(port);
    loop {
        let redis_input : String = pubsub.get_message()
            .expect("Failed to get message")
            .get_payload()
            .expect("Failed to get payload");
        println!("Received from Redis: {}", redis_input);

        // Now send the input to the Arduino
        let send_buf: Vec<u8> = redis_input.into();
        let send = port.get_mut();
        send.write_all(&send_buf).expect("Failed to write to serial port");
        
        println!("Receiving data on {} at {} baud:", &port_name, &baud_rate);
        
        // read the response from the Arduino and return with timestamp
        let mut res = receive_arduino(send);
        let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        let mut insert = String::from("|");
        insert.push_str(&time.as_millis().to_string());
        res.insert_str(res.find('>').unwrap(), &insert);
        
        publish_ack(&mut pub_client, &res);
    }
}

fn receive_arduino(port: &mut Box<dyn SerialPort>) -> String {
    // Propably not as solid as Arduino receive code lol
    let mut rec_buf: Vec<u8> = vec![0; 1000];
    let mut result: String = String::new();
    loop {
        match port.read(rec_buf.as_mut_slice()) {
            Ok(t) => {
                let partial = str::from_utf8(&rec_buf[..t]).unwrap();
                result += partial;
                let start = result.find("<");
                let end: Option<usize> = result.find(">");
                if start.is_none() || end.is_none() {
                  continue;
                }
                if end.unwrap() > start.unwrap() {
                    println!("Received from Arduino: {}", result);
                    return result;
                }
            },
            Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
            Err(e) => eprintln!("{:?}", e),
        }
    }
}

fn publish_ack(client: &mut redis::Connection, message: &str) {
    match client.publish::<&str, &str, i32>("ris_position_ack", message){
        Ok(_) => {
            println!("Acked");
        },
        Err(err) => {
            eprintln!("Ack fail: {}", err);
        }
    };
}