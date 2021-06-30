module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        userId: String,
        name: String,
        manufacturer: String,
        description: String,
        mainPepper: String,
        imageUrl: String,
        heat: Number,
        likes: Number,
        dislikes: Number,
        usersLiked: [String],
        usersDisliked: [String]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Sauce = mongoose.model("sauce", schema);
    return Sauce;
  };