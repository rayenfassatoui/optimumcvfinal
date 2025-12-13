'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profile } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { ProfileData } from '@/features/onboarding/types';

export async function getResumeById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const resume = await db.query.profile.findFirst({
    where: eq(profile.id, id),
  });

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found');
  }

  return resume;
}

export async function createResume(name: string = 'New Resume') {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const emptyData: ProfileData = {
    fullName: session.user.name || '',
    email: session.user.email || '',
    phone: '',
    linkedinUrl: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };

  const [newResume] = await db
    .insert(profile)
    .values({
      userId: session.user.id,
      name: name,
      content: JSON.stringify(emptyData),
    })
    .returning();

  return newResume;
}

export async function updateResume(
  id: string,
  data: ProfileData,
  name?: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const resume = await db.query.profile.findFirst({
    where: eq(profile.id, id),
  });

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found');
  }

  await db
    .update(profile)
    .set({
      content: JSON.stringify(data),
      ...(name && { name }),
      updatedAt: new Date(),
    })
    .where(eq(profile.id, id));

  return { success: true };
}

export async function deleteResume(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const resume = await db.query.profile.findFirst({
    where: eq(profile.id, id),
  });

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found');
  }

  await db.delete(profile).where(eq(profile.id, id));

  return { success: true };
}

export async function renameResume(id: string, newName: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Trim and validate the new name
  const trimmedName = newName.trim();
  if (!trimmedName) {
    throw new Error('Resume name cannot be empty');
  }

  // Check if resume exists and belongs to user
  const resume = await db.query.profile.findFirst({
    where: eq(profile.id, id),
  });

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found');
  }

  // Check for duplicate name (case-insensitive)
  const existingResume = await db.query.profile.findFirst({
    where: (profiles, { and, eq, ne, sql }) =>
      and(
        eq(profiles.userId, session.user.id),
        ne(profiles.id, id),
        sql`lower(${profiles.name}) = lower(${trimmedName})`
      ),
  });

  if (existingResume) {
    throw new Error('A resume with this name already exists');
  }

  // Update the resume name
  await db
    .update(profile)
    .set({
      name: trimmedName,
      updatedAt: new Date(),
    })
    .where(eq(profile.id, id));

  return { success: true };
}
