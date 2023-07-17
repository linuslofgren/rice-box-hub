use std::str;
use redis::Commands;
use std::{thread, time::Duration};

pub fn main() {
    // the port is passed using `cargo run -- <port_name>`

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
    
    loop {
        let redis_input : String = pubsub.get_message()
            .expect("Failed to get message")
            .get_payload()
            .expect("Failed to get payload");
        println!("Received from Redis: {}", redis_input);

        // Pretend like Arduino completed  
        thread::sleep(Duration::from_millis(200));
        publish_ack(&mut pub_client, &redis_input);
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