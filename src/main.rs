#![feature(plugin)]
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

// The type to represent the ID of a message.
type ID = usize;
type SimpleMap = HashMap<&'static str, &'static str>;

// We're going to store all of the messages here. No need for a DB.
lazy_static! {
    static ref MAP: Mutex<HashMap<ID, String>> = Mutex::new(HashMap::new());
}

#[derive(Serialize, Deserialize)]
struct Message {
    id: Option<ID>,
    contents: String
}

#[derive(Serialize, Deserialize)]
struct Event {
    id: Option<ID>,
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
    "helloworld"
}

#[error(404)]
fn not_found() -> JSON<SimpleMap> {
    JSON(map! {
        "status" => "error",
        "reason" => "Resource was not found."
    })
}

fn cassandra(){

    let query = stmt!("SELECT keyspace_name FROM system_schema.keyspaces;");
    let col_name = "keyspace_name";

    let contact_points = ContactPoints::from_str("127.0.0.1").unwrap();

    let mut cluster = Cluster::default();
    cluster.set_contact_points(contact_points).unwrap();
    cluster.set_load_balance_round_robin();

    match cluster.connect() {
        Ok(ref mut session) => {
            let result = session.execute(&query).wait().unwrap();
            println!("{}", result);
            for row in result.iter() {
                let col: String = row.get_col_by_name(col_name).unwrap();
                println!("ks name = {}", col);
            }
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
