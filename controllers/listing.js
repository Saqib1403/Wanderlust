const Listing = require("../models/listing.js");
const fs = require("fs");
const { cloudinary } = require("../cloudConfig.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  return res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "wanderlust",
    });

    fs.unlinkSync(req.file.path);

    const newListing = new Listing(req.body.Listing);
    newListing.owner = req.user._id;

    newListing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };

    await newListing.save();

    req.flash("success", "New Listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.log(err);
    req.flash("error", "Image upload failed");
    return res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  let previewUrl = originalImageUrl;

  if (originalImageUrl.includes("/upload")) {
    previewUrl = originalImageUrl.replace(
      "/upload",
      "/upload/w_250,h_200,c_fill"
    );
  }

  return res.render("listings/edit.ejs", { listing, previewUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.Listing });

  if (req.file) {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "wanderlust",
    });

    fs.unlinkSync(req.file.path);

    listing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
