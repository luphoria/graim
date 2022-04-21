let TMP_TEST_DB = {
  users: [
    {
      name: "test-account",
      matrix: "graimtesting:matrix.org",
      discord: "325116477185196033",
    },
  ],
};

export const lookup_user = (name: String) => {
  let graim_name: String;
  let user_matrix: String;
  let user_discord: String;

  TMP_TEST_DB.users.forEach((_user) => {
    if (_user.name == name) {
      console.log("Graim user FOUND in db");
      graim_name = _user.name;
    }
    if (_user.discord == name.replace("t2bot.io", "").replace(/[^0-9]/g, "")) {
      console.log("Discord user FOUND in db");
      graim_name = _user.name;
    }
    if (_user.matrix == name.replace("@", "")) {
      console.log("Matrix user FOUND in db");
      graim_name = _user.name;
    }
  });

  TMP_TEST_DB.users.forEach((_user) => {
    if (_user.name == graim_name) {
      user_matrix = "@" + _user.matrix;
      user_discord = _user.discord;
    }
  });

  return {
      "graim_name": graim_name,
      "user_matrix": user_matrix,
      "user_discord": user_discord
  };
};
