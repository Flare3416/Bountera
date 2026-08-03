import { prisma } from "@/lib/prisma";

const USER_INCLUDE = {
  skills: true,
  experiences: true,
  projects: true,
  achievements: true,
  socialLinks: true,
};

// Load a user by a unique lookup and serialize it into the public API shape
// (profile + points + rank + relational data). Shared by the email and
// username user routes so both return identical payloads.
export async function getPublicUser(where) {
  const user = await prisma.user.findUnique({
    where,
    include: USER_INCLUDE,
  });

  if (!user) return null;

  const higherRanked = await prisma.user.count({
    where: {
      points: {
        gt: user.points,
      },
    },
  });

  return {
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
    rank: higherRanked + 1,

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
  };
}
