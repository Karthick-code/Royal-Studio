import { ProjectRepo } from "../models/Project.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await ProjectRepo.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Database failure loading projects portfolio.", error: err.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, images } = req.body;

  if (!title || title.trim().length === 0) {
    res.status(400).json({ msg: "Project title is required." });
    return;
  }

  if (!description || description.trim().length === 0) {
    res.status(400).json({ msg: "Project description is required." });
    return;
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    res.status(400).json({ msg: "At least one portfolio image URL is required." });
    return;
  }

  // Double check that all elements in images are strings
  const validImages = images.map(img => String(img).trim()).filter(img => img.length > 0);
  if (validImages.length === 0) {
    res.status(400).json({ msg: "Please provide valid image URLs for this project." });
    return;
  }

  try {
    const project = await ProjectRepo.create({
      title: title.trim(),
      description: description.trim(),
      images: validImages
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: "Database failure recording new project.", error: err.message });
  }
};
