import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        skills: true,
        experiences: true,
        projects: true,
        achievements: true,
        socialLinks: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: {
          email: body.email,
        },
        update: {
          ...(body.role !== undefined && { role: body.role }),
          ...(body.profileCompleted !== undefined && {
            profileCompleted: body.profileCompleted,
          }),

          ...(body.name !== undefined && { name: body.name }),
          ...(body.username !== undefined && { username: body.username }),
          ...(body.bio !== undefined && { bio: body.bio }),

          ...(body.companyName !== undefined && {
            companyName: body.companyName,
          }),
          ...(body.website !== undefined && { website: body.website }),
          ...(body.industry !== undefined && { industry: body.industry }),

          ...(body.profileImage !== undefined && {
            profileImage: body.profileImage,
          }),
          ...(body.backgroundImage !== undefined && {
            backgroundImage: body.backgroundImage,
          }),
        },

        create: {
          email: body.email,

          role: body.role ?? null,
          profileCompleted: body.profileCompleted ?? false,

          name: body.name ?? null,
          username: body.username ?? null,
          bio: body.bio ?? null,

          companyName: body.companyName ?? null,
          website: body.website ?? null,
          industry: body.industry ?? null,

          profileImage: body.profileImage ?? null,
          backgroundImage: body.backgroundImage ?? null,
        },
      });

      // Clear old relational data
      await tx.skill.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.experience.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.project.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.achievement.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.socialLink.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Skills
      if (Array.isArray(body.skills) && body.skills.length) {
        await tx.skill.createMany({
          data: body.skills.map((name) => ({
            userId: user.id,
            name,
          })),
        });
      }

      // Experience
      if (Array.isArray(body.experience) && body.experience.length) {
        await tx.experience.createMany({
          data: body.experience.map((exp) => ({
            userId: user.id,
            title: exp.title || "",
            company: exp.company || "",
            duration: exp.duration || "",
            description: exp.description || null,
          })),
        });
      }

      // Projects
      if (Array.isArray(body.projects) && body.projects.length) {
        await tx.project.createMany({
          data: body.projects.map((project) => ({
            userId: user.id,
            title: project.title || "",
            description: project.description || null,
            image: project.image || null,
            technologies: project.technologies || [],
            link: project.link || null,
          })),
        });
      }

      // Achievements
      if (Array.isArray(body.achievements) && body.achievements.length) {
        await tx.achievement.createMany({
          data: body.achievements.map((achievement) => ({
            userId: user.id,
            title: achievement.title || "",
            description: achievement.description || null,
            icon: achievement.icon || null,
          })),
        });
      }

      // Social Links
      if (Array.isArray(body.socialLinks) && body.socialLinks.length) {
        await tx.socialLink.createMany({
          data: body.socialLinks.map((link) => ({
            userId: user.id,
            platform: link.platform || "",
            url: link.url || "",
          })),
        });
      }

      return await tx.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          skills: true,
          experiences: true,
          projects: true,
          achievements: true,
          socialLinks: true,
        },
      });
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}