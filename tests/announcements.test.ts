import { describe, it, expect } from 'vitest';
import {
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
} from '../src/validators/announcements.validator.ts';

describe('CreateAnnouncementSchema', () => {
  const validAnnouncement = {
    title: 'MacBook Pro 14 M2 Pro 16GB/512GB',
    description:
      'Selling my MacBook Pro in mint condition. Battery health is 96%, includes original charger and box.',
    price: 1450,
    category: 'sale',
  };

  it('should pass validation with valid required fields', () => {
    const result = CreateAnnouncementSchema.safeParse(validAnnouncement);

    expect(result.success).toBe(true);
  });

  it('should pass validation when optional valid imageUrl is provided', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      imageUrl:
        'https://res.cloudinary.com/demo/image/upload/v1/announcements/abc123.jpg',
    });

    expect(result.success).toBe(true);
  });

  it('should fail if title is shorter than 5 characters', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      title: 'Mac',
    });

    expect(result.success).toBe(false);
  });

  it('should fail if title is missing', () => {
    const { title, ...withoutTitle } = validAnnouncement;
    const result = CreateAnnouncementSchema.safeParse(withoutTitle);

    expect(result.success).toBe(false);
  });

  it('should fail if price is 0 or negative', () => {
    const zeroPrice = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      price: 0,
    });
    const negativePrice = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      price: -100,
    });

    expect(zeroPrice.success).toBe(false);
    expect(negativePrice.success).toBe(false);
  });

  it('should fail if imageUrl is not a valid URL', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      imageUrl: 'invalid-url-string',
    });

    expect(result.success).toBe(false);
  });
});

describe('UpdateAnnouncementSchema', () => {
  it('should pass when updating a single valid field (e.g., price)', () => {
    const result = UpdateAnnouncementSchema.safeParse({
      price: 1200,
    });

    expect(result.success).toBe(true);
  });

  it('should pass when updating multiple valid fields', () => {
    const result = UpdateAnnouncementSchema.safeParse({
      title: 'Updated MacBook Pro 14 Title',
      category: 'other',
      imageUrl:
        'https://res.cloudinary.com/demo/image/upload/v1/announcements/updated.jpg',
    });

    expect(result.success).toBe(true);
  });

  it('should fail when an empty object is provided', () => {
    const result = UpdateAnnouncementSchema.safeParse({});

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'At least one field must be provided for update'
      );
    }
  });
});
