import connectDB from '../../../lib/mongodb.js';
import { Category, Skill, seedCategoriesAndSkills } from '../../../models/Category.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'categories' or 'skills'
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const popular = searchParams.get('popular');
    const seed = searchParams.get('seed');
    
    // Seed default categories and skills
    if (seed === 'true') {
      await seedCategoriesAndSkills();
      return NextResponse.json({ 
        success: true, 
        message: 'Categories and skills seeded successfully' 
      });
    }
    
    // Get categories
    if (type === 'categories') {
      const categories = await Category.getActiveCategories();
      return NextResponse.json({ success: true, data: categories });
    }
    
    // Get skills
    if (type === 'skills') {
      if (popular === 'true') {
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skills = await Skill.getPopularSkills(limit);
        return NextResponse.json({ success: true, data: skills });
      }
      
      if (categoryId) {
        const skills = await Skill.getSkillsByCategory(categoryId);
        return NextResponse.json({ success: true, data: skills });
      }
      
      if (search) {
        const skills = await Skill.searchSkills(search);
        return NextResponse.json({ success: true, data: skills });
      }
      
      // Get all skills with pagination
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 50;
      const skip = (page - 1) * limit;
      
      const skills = await Skill.find({ isActive: true })
        .populate('category', 'name color')
        .sort({ popularity: -1, name: 1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Skill.countDocuments({ isActive: true });
      
      return NextResponse.json({
        success: true,
        data: skills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // Get both categories and skills hierarchy
    const categories = await Category.getCategoryHierarchy();
    const skills = await Skill.getPopularSkills(100);
    
    return NextResponse.json({
      success: true,
      data: {
        categories,
        skills
      }
    });
    
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { type, ...data } = body;
    
    if (type === 'category') {
      // Create new category
      const { name, description, icon, color, parentCategory } = data;
      
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Category name is required' },
          { status: 400 }
        );
      }
      
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Category already exists' },
          { status: 409 }
        );
      }
      
      const newCategory = new Category({
        name,
        description,
        icon: icon || '📁',
        color: color || '#6366f1',
        parentCategory: parentCategory || null
      });
      
      await newCategory.save();
      
      return NextResponse.json(
        { success: true, data: newCategory },
        { status: 201 }
      );
      
    } else if (type === 'skill') {
      // Create new skill
      const { name, category, level, description } = data;
      
      if (!name || !category) {
        return NextResponse.json(
          { success: false, error: 'Skill name and category are required' },
          { status: 400 }
        );
      }
      
      const existingSkill = await Skill.findOne({ name });
      if (existingSkill) {
        return NextResponse.json(
          { success: false, error: 'Skill already exists' },
          { status: 409 }
        );
      }
      
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      const newSkill = new Skill({
        name,
        category,
        level: level || 'Beginner',
        description
      });
      
      await newSkill.save();
      
      const populatedSkill = await Skill.findById(newSkill._id)
        .populate('category', 'name color');
      
      return NextResponse.json(
        { success: true, data: populatedSkill },
        { status: 201 }
      );
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "category" or "skill"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { type, id, action, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    if (type === 'category') {
      const category = await Category.findById(id);
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      if (action === 'update_bounty_count') {
        await category.updateBountyCount();
      } else {
        Object.keys(updateData).forEach(key => {
          if (key !== '_id' && key !== 'createdAt') {
            category[key] = updateData[key];
          }
        });
        await category.save();
      }
      
      return NextResponse.json({ success: true, data: category });
      
    } else if (type === 'skill') {
      const skill = await Skill.findById(id);
      if (!skill) {
        return NextResponse.json(
          { success: false, error: 'Skill not found' },
          { status: 404 }
        );
      }
      
      if (action === 'increment_popularity') {
        await skill.incrementPopularity();
      } else {
        Object.keys(updateData).forEach(key => {
          if (key !== '_id' && key !== 'createdAt') {
            skill[key] = updateData[key];
          }
        });
        await skill.save();
      }
      
      const populatedSkill = await Skill.findById(id)
        .populate('category', 'name color');
      
      return NextResponse.json({ success: true, data: populatedSkill });
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "category" or "skill"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('PATCH /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      );
    }
    
    if (type === 'category') {
      const category = await Category.findById(id);
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      // Check if category has bounties
      const Bounty = (await import('../../../models/Bounty.js')).default;
      const bountyCount = await Bounty.countDocuments({ category: category.name });
      
      if (bountyCount > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete category with existing bounties' },
          { status: 400 }
        );
      }
      
      // Delete associated skills
      await Skill.deleteMany({ category: id });
      
      await Category.findByIdAndDelete(id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Category and associated skills deleted successfully' 
      });
      
    } else if (type === 'skill') {
      const skill = await Skill.findByIdAndDelete(id);
      if (!skill) {
        return NextResponse.json(
          { success: false, error: 'Skill not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Skill deleted successfully' 
      });
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "category" or "skill"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}