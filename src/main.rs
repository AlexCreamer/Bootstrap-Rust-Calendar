#![feature(plugin)]
#![feature(custom_derive, custom_attribute)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate serde_json;
#[macro_use] extern crate lazy_static;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;

#[cfg(test)] mod tests;

use rocket_contrib::JSON;
use std::collections::HashMap;
use std::sync::Mutex;

use std::io;
use std::path::{Path, PathBuf};
use rocket::response::NamedFile;

#[macro_use(stmt)]
extern crate cassandra;
use cassandra::*;
use std::str::FromStr;
use errors::*;

#[derive(Serialize, Deserialize)]
struct Event {
    id: String,
    name: String,
    location: String,
    start_date: String,
    end_date: String
}

#[get("/calendar")]
fn index() -> io::Result<NamedFile> {
    NamedFile::open("static/index.html")
}

#[get("/calendar/<file..>")]
fn files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

// TODO: This example can be improved by using `route` with muliple HTTP verbs.
#[post("/save_event", format = "application/json", data = "<message>")]
fn save(message: JSON<Event>) ->  &'static str {
	save_event(message);
	"hello cassandra"
}

#[error(404)]
fn not_found() ->  &'static str {
    "Error: Resource was not found"
}

fn save_event(event: JSON<Event>){
    let mut statement = stmt!("INSERT INTO events (id, name, location, start_date, end_date)
        VALUES (?, ?, ?, ?, ?);");

    statement.bind(0, event.id.as_str());
    statement.bind(1, event.name.as_str());
    statement.bind(2, event.location.as_str());
    statement.bind(3, event.start_date.as_str());
    statement.bind(4, event.end_date.as_str());

    let contact_points = ContactPoints::from_str("127.0.0.1").unwrap();

    let mut cluster = Cluster::default();
    cluster.set_contact_points(contact_points).unwrap();
    cluster.set_load_balance_round_robin();

    match cluster.connect() {
        Ok(ref mut session) => {
            let result = session.execute(&statement).wait().unwrap();
        }
        err => println!("{:?}", err),
    }
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index, files, save])
        .catch(errors![not_found])
        .launch();
}
