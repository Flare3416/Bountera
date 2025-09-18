import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  description: { 
    type: String,
    maxlength: 500 
  },
  icon: { 
    type: String, // Icon name or emoji
    default: '📁' 
  },
  color: { 
    type: String, // Hex color for UI
    default: '#6366f1' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  bountyCount: { 
    type: Number, 
    default: 0 
  },
  parentCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    default: null 
  }
}, {
  timestamps: true,
  collection: 'categories'
});

const SkillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    default: 'Beginner' 
  },
  description: { 
    type: String,
    maxlength: 300 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  popularity: { 
    type: Number, 
    default: 0 
  }, // How many bounties/users use this skill
  relatedSkills: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill' 
  }]
}, {
  timestamps: true,
  collection: 'skills'
});

// Indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ parentCategory: 1 });

SkillSchema.index({ name: 1 });
SkillSchema.index({ category: 1 });
SkillSchema.index({ popularity: -1 });
SkillSchema.index({ isActive: 1 });

// Category Methods
CategorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true })
    .sort({ bountyCount: -1, name: 1 });
};

CategorySchema.statics.getCategoryHierarchy = function() {
  return this.find({ isActive: true })
    .populate('parentCategory', 'name')
    .sort({ parentCategory: 1, name: 1 });
};

CategorySchema.methods.updateBountyCount = async function() {
  const Bounty = mongoose.model('Bounty');
  const count = await Bounty.countDocuments({ 
    category: this.name,
    status: { $ne: 'cancelled' }
  });
  this.bountyCount = count;
  return this.save();
};

// Skill Methods
SkillSchema.statics.getPopularSkills = function(limit = 20) {
  return this.find({ isActive: true })
    .populate('category', 'name color')
    .sort({ popularity: -1 })
    .limit(limit);
};

SkillSchema.statics.getSkillsByCategory = function(categoryId) {
  return this.find({ 
    category: categoryId,
    isActive: true 
  })
  .sort({ popularity: -1, name: 1 });
};

SkillSchema.statics.searchSkills = function(searchTerm) {
  return this.find({
    name: { $regex: searchTerm, $options: 'i' },
    isActive: true
  })
  .populate('category', 'name color')
  .sort({ popularity: -1 })
  .limit(10);
};

SkillSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

// Export both models
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);

// Default categories and skills seeder
export const seedCategoriesAndSkills = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('Categories already exist, skipping seed');
      return;
    }

    // Default categories
    const defaultCategories = [
      { name: 'Web Development', description: 'Frontend and backend web development', icon: '🌐', color: '#3b82f6' },
      { name: 'Mobile Development', description: 'iOS, Android, and cross-platform apps', icon: '📱', color: '#10b981' },
      { name: 'UI/UX Design', description: 'User interface and experience design', icon: '🎨', color: '#f59e0b' },
      { name: 'Data Science', description: 'Data analysis, ML, and AI projects', icon: '📊', color: '#8b5cf6' },
      { name: 'Blockchain', description: 'Cryptocurrency and DeFi projects', icon: '⛓️', color: '#f97316' },
      { name: 'DevOps', description: 'Infrastructure and deployment', icon: '⚙️', color: '#6b7280' },
      { name: 'Testing', description: 'Quality assurance and testing', icon: '🧪', color: '#ef4444' },
      { name: 'Documentation', description: 'Technical writing and documentation', icon: '📝', color: '#06b6d4' }
    ];

    const categories = await Category.insertMany(defaultCategories);
    console.log('✅ Categories seeded successfully');

    // Default skills for each category
    const skillsData = [
      // Web Development
      { categoryName: 'Web Development', skills: [
        'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 
        'Express.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap',
        'PHP', 'Laravel', 'Django', 'Flask', 'Ruby on Rails', 'ASP.NET'
      ]},
      // Mobile Development
      { categoryName: 'Mobile Development', skills: [
        'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Objective-C',
        'Xamarin', 'Ionic', 'Cordova', 'Unity'
      ]},
      // UI/UX Design
      { categoryName: 'UI/UX Design', skills: [
        'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision',
        'Principle', 'Framer', 'Wireframing', 'Prototyping'
      ]},
      // Data Science
      { categoryName: 'Data Science', skills: [
        'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow',
        'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau', 'Power BI'
      ]},
      // Blockchain
      { categoryName: 'Blockchain', skills: [
        'Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'DeFi', 'NFTs',
        'Bitcoin', 'Hyperledger', 'Truffle', 'Hardhat'
      ]},
      // DevOps
      { categoryName: 'DevOps', skills: [
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins',
        'GitHub Actions', 'Terraform', 'Ansible', 'Linux'
      ]},
      // Testing
      { categoryName: 'Testing', skills: [
        'Jest', 'Cypress', 'Selenium', 'Puppeteer', 'Mocha', 'Chai',
        'Unit Testing', 'Integration Testing', 'E2E Testing', 'Manual Testing'
      ]},
      // Documentation
      { categoryName: 'Documentation', skills: [
        'Technical Writing', 'API Documentation', 'Markdown', 'GitBook',
        'Confluence', 'Notion', 'Swagger', 'Postman'
      ]}
    ];

    for (const categoryData of skillsData) {
      const category = categories.find(cat => cat.name === categoryData.categoryName);
      if (category) {
        const skills = categoryData.skills.map(skillName => ({
          name: skillName,
          category: category._id,
          level: 'Intermediate',
          popularity: Math.floor(Math.random() * 50) + 1
        }));
        await Skill.insertMany(skills);
      }
    }

    console.log('✅ Skills seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding categories and skills:', error);
  }
};