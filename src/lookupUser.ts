// TODO - make up your damn mind! do you want the @ or not? (i don't)

import config from "./config";
const file = require("fs");
export let db = JSON.parse(file.readFileSync("./graimdb.json"));
if(!db.rooms) db.rooms = {};
if(!db.mods) db.mods = {};
if(!db.users) db.users = [];
if(!db.logto) db.logto = "";

export const saveDB = (json) => {
  // Overwrite graimdb.json
  file.writeFileSync("./graimdb.json", JSON.stringify(json));
};

export const user_discordId = (user: string) => {
  // Returns a valid Discord ID if the Matrix ID was a bridged Discord user
  user = user.replace("@","")
  if (
    !isNaN(+user.substring(9, 27)) && // !isNaN(+"string") makes sure that the substring is a number (like a snowflake ID).
    user.split(":")[1] == config.appserviceHS // makes sure that the Matrix ID is based in the correct homeserver
  ) {
    console.log(user.substring(9, 27));
    return user.substring(9, 27);
  }
  console.log(user.substring(9, 27));
  if (!isNaN(+user) && user.length == 18) {
    return user;
  }
  return null;
};

export const lookup_user = (name: String) => {
  // Reverses a user from graim's db based on any format data given from the user
  let graim_name: string;
  let user_matrix: string;
  let user_discord: string;
  let moderator: boolean;
  let strikes: [];

  db.users.forEach((_user) => {
    // iterate through all db users
    if (_user.name == name) {
      // the name must have been a Graim identifier
      console.log("Graim user FOUND in db");
      graim_name = _user.name;
    }
    if (
      (_user.discord == name.replace("@", "").substring(9, 27) &&
      name.split(":")[1] == config.appserviceHS) || (_user.discord == name.replace("@", ""))
    ) {
      // the name must have been a Discord ID
      console.log("Discord user FOUND in db");
      graim_name = _user.name;
    }
    if (_user.matrix == name.replace("@", "")) {
      // the name must have been a Matrix ID
      console.log("Matrix user FOUND in db");
      graim_name = _user.name;
    }
  });

  db.users.forEach((_user) => {
    // iterate through users again to now grab the rest of the data about that user
    if (_user.name == graim_name) {
      // match!
      user_matrix = "@" + _user.matrix;
      user_discord = _user.discord;
      strikes = _user.strikes;
    }
  });

  moderator = db.mods[graim_name] ? true : false; // if the username is in the moderator list, it is a moderator.

  return {
    graim_name: graim_name,
    user_matrix: user_matrix,
    user_discord: user_discord,
    moderator: moderator,
    strikes: strikes,
  };
};
