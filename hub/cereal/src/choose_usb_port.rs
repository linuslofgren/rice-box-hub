use std::io;
use serialport::SerialPortType;

pub fn choose_usb_port() -> Option<serialport::SerialPortInfo> {
    let serial_ports: Vec<serialport::SerialPortInfo> = serialport::available_ports().expect("None");
    let usb_ports: Vec<_> = serial_ports.iter().filter(|port| {
        match port.port_type {
            SerialPortType::UsbPort(_) => true,
            _ => false
        }
    }).collect();
    
    let mut input: String = String::new();
    print!("Choose port with number: ");
    for (i, port) in usb_ports.iter().enumerate() {
        if let SerialPortType::UsbPort(usb_info) = port.port_type.clone() {
            println!("[{}] {}", i, usb_info.product.unwrap());
        }
    }
    println!();
    
    let mut returnval: Option<serialport::SerialPortInfo> = None;
    match io::stdin().read_line(&mut input) {
        Ok(_) => {
            let num = input.trim().parse::<usize>().unwrap();
            returnval = Some(usb_ports[num].clone());
        }
        Err(error) => {
            // returnval = String::from("Guuuuuuuh");
            eprintln!("Error: {}", error);
        }
  }
  return returnval;
}