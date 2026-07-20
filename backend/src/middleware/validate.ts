import { Request, Response, NextFunction } from 'express';

// Simple HTML/script tag regex sanitizer
const sanitizeInput = (val: string): string => {
  if (typeof val !== 'string') return val;
  return val.replace(/<[^>]*>/g, '').trim();
};

export const validateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email } = req.body;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid email address format.' });
  }

  if (firstName !== undefined && (!firstName.trim() || firstName.length > 50)) {
    return res.status(400).json({ error: 'Bad Request', message: 'First name must be between 1 and 50 characters.' });
  }

  if (lastName !== undefined && (!lastName.trim() || lastName.length > 50)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Last name must be between 1 and 50 characters.' });
  }

  // Sanitization: clean string inputs
  if (req.body.firstName) req.body.firstName = sanitizeInput(req.body.firstName);
  if (req.body.lastName) req.body.lastName = sanitizeInput(req.body.lastName);
  if (req.body.title) req.body.title = sanitizeInput(req.body.title);

  next();
};

export const validateResume = (req: Request, res: Response, next: NextFunction) => {
  const { title, personalInfo, experience, education, projects, skills } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'Resume title cannot be empty.' });
  }

  if (personalInfo) {
    if (personalInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid contact email format.' });
    }
  }

  if (experience && !Array.isArray(experience)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Experience must be an array of work entries.' });
  }

  if (education && !Array.isArray(education)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Education must be an array of degree entries.' });
  }

  if (projects && !Array.isArray(projects)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Projects must be an array of project entries.' });
  }

  if (skills && !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Skills must be an array of tags.' });
  }

  next();
};
