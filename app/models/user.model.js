module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        email: {type: String, unique: true, lowercase: true, index: true, required: true},
        password: {type: String, required: true}
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.userId = _id;
      return object;
    });
  
    const User = mongoose.model("User", schema);
    return User;
  };