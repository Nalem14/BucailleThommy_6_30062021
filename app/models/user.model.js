module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        email: {type: String, unique: true, index: true, required: true},
        password: {type: String, required: true},
        usersAlert: [{ type : String, ref: 'User' }],
      },
      { timestamps: true }
    );
  
    const User = mongoose.model("User", schema);
    return User;
  };