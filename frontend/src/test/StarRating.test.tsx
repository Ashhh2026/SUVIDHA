import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StarRating } from '../components/feedback/StarRating';

describe('StarRating Component', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating value={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(5);
  });

  it('triggers onChange callback when a star is clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating value={2} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]); // Click 5th star
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('displays correct verbal label for score', () => {
    render(<StarRating value={5} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });
});
