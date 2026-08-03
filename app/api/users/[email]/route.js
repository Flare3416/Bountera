import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const [user, higherRankedUsers] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: decodedEmail,
        },
        include: {
          skills: true,
          experiences: true,
          projects: true,
          achievements: true,
          socialLinks: true,
        },
      }),
      prisma.user.count({
        where: {
          points: {
            gt: 0,
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,

      name: user.name,
      bio: user.bio,

      profileImage: user.profileImage,
      backgroundImage: user.backgroundImage,

      companyName: user.companyName,
      website: user.website,
      industry: user.industry,

      profileCompleted: user.profileCompleted,
      verified: user.verified,
      points: user.points,
      rank:
        (await prisma.user.count({
          where: {
            points: {
              gt: user.points,
            },
          },
        })) + 1,

      skills: user.skills.map((skill) => skill.name),

      experience: user.experiences.map((exp) => ({
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        description: exp.description,
      })),

      projects: user.projects.map((project) => ({
        title: project.title,
        description: project.description,
        image: project.image,
        technologies: project.technologies || [],
        link: project.link,
      })),

      achievements: user.achievements.map((achievement) => ({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
      })),

      socialLinks: user.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
      })),
    });
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