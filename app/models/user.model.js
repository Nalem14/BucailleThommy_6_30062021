module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        email: String,
        password: String
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.userId = _id;
      return object;
    });
  
    const User = mongoose.model("user", schema);
    return User;
  };