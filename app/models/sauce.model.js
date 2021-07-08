module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        userId: {type: String, required: true, ref: 'User'},
        name: {type: String, required: true},
        manufacturer: String,
        description: String,
        mainPepper: String,
        imageUrl: String,
        heat: Number,
        likes: Number,
        dislikes: Number,
        usersLiked: [{ type : String, ref: 'User' }],
        usersDisliked: [{ type : String, ref: 'User' }]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Sauce = mongoose.model("Sauce", schema);
    return Sauce;
  };