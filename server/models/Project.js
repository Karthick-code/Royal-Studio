import mongoose, { Schema } from "mongoose";
import { getDbState, readLocalFile, writeLocalFile } from "../config/db.js";

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

const MongoProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

// Beautiful stock images representing the studio categories
const DEFAULT_PROJECT_SEEDS = [
  {
    _id: "proj_1",
    title: "Elysian Bloom Wedding",
    description: "An elegant outdoor garden wedding ceremonies in pristine daylight capturing candid intimate moments.",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-04-10")
  },
  {
    _id: "proj_2",
    title: "Golden Hour Romance",
    description: "Pre-wedding cinematic session at a serene lakeside location during the majestic sunset twilight.",
    images: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-05-12")
  },
  {
    _id: "proj_3",
    title: "Vanguard Fashion Reel",
    description: "High-definition video production, narrative storytelling reels and professional sound synthesis capturing dynamic motion.",
    images: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-05-20")
  },
  {
    _id: "proj_4",
    title: "Vogue Portrait Session",
    description: "Studio lighting and studio-grade portraits focusing on high contrast, visual clarity, and editorial look.",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-05-22")
  }
];

// Hybrid handler for Projects
export const ProjectRepo = {
  find: async () => {
    if (getDbState()) {
      const dbProjects = await MongoProjectModel.find().sort({ createdAt: -1 });
      if (dbProjects.length === 0) {
        // If real DB has no mock projects yet, let's return seeds
        return DEFAULT_PROJECT_SEEDS;
      }
      return dbProjects;
    } else {
      return readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
    }
  },

  create: async (data) => {
    if (getDbState()) {
      return await MongoProjectModel.create(data);
    } else {
      const projects = readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
      const newProj = {
        _id: `proj_${Date.now()}`,
        title: data.title,
        description: data.description,
        images: data.images,
        createdAt: new Date()
      };
      projects.push(newProj);
      writeLocalFile("projects.json", projects);
      return newProj;
    }
  }
};

export default MongoProjectModel;
