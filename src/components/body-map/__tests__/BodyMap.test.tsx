import React from 'react';
import { render } from '@testing-library/react';
import * as RTL from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BodyMap from '../BodyMap';
import { validateAccessibility } from '../../../utils/test-helpers';

// Re-export for easier usage
const { screen, fireEvent } = RTL;

describe('BodyMap', () => {
  it('renders without crashing', () => {
    render(<BodyMap />);
    expect(screen.getByTestId('body-map')).toBeInTheDocument();
  });

  it('displays all body regions', () => {
    render(<BodyMap />);
    const regions = ['head', 'torso', 'arms', 'legs'];
    regions.forEach(region => {
      expect(screen.getByTestId(`region-${region}`)).toBeInTheDocument();
    });
  });

  it('shows points for selected region', async () => {
    render(<BodyMap />);
    const headRegion = screen.getByTestId('region-head');
    fireEvent.click(headRegion);
    
    // Wait for points to appear
    const points = await screen.findAllByTestId(/point-marker/);
    expect(points.length).toBeGreaterThan(0);
  });

  it('handles view toggle between front and back', () => {
    render(<BodyMap />);
    const viewToggle = screen.getByRole('button', { name: /toggle view/i });
    
    fireEvent.click(viewToggle);
    expect(screen.getByTestId('body-map')).toHaveAttribute('data-view', 'back');
    
    fireEvent.click(viewToggle);
    expect(screen.getByTestId('body-map')).toHaveAttribute('data-view', 'front');
  });

  it('shows point details on marker click', async () => {
    render(<BodyMap />);
    const headRegion = screen.getByTestId('region-head');
    fireEvent.click(headRegion);
    
    const firstPoint = (await screen.findAllByTestId(/point-marker/))[0];
    fireEvent.click(firstPoint);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('maintains selected region state', () => {
    render(<BodyMap />);
    const headRegion = screen.getByTestId('region-head');
    const torsoRegion = screen.getByTestId('region-torso');
    
    fireEvent.click(headRegion);
    expect(headRegion).toHaveClass('selected');
    
    fireEvent.click(torsoRegion);
    expect(headRegion).not.toHaveClass('selected');
    expect(torsoRegion).toHaveClass('selected');
  });

  describe('accessibility', () => {
    it('should be accessible', async () => {
      await validateAccessibility(<BodyMap />);
    });

    it('should be keyboard navigable', () => {
      render(<BodyMap />);
      
      const regions = screen.getAllByRole('button');
      const firstRegion = regions[0];
      
      // Focus first region
      firstRegion.focus();
      expect(document.activeElement).toBe(firstRegion);
      
      // Tab through regions
      userEvent.tab();
      expect(document.activeElement).toBe(regions[1]);
    });

    it('should announce region changes to screen readers', () => {
      render(<BodyMap />);
      const headRegion = screen.getByTestId('region-head');
      
      fireEvent.click(headRegion);
      
      expect(screen.getByRole('alert')).toHaveTextContent(/head region selected/i);
    });

    it('should have proper ARIA labels', () => {
      render(<BodyMap />);
      
      expect(screen.getByRole('button', { name: /toggle body view/i }))
        .toBeInTheDocument();
        const regions = screen.getAllByRole('button');
      regions.forEach((region: HTMLElement) => {
        expect(region).toHaveAttribute('aria-label');
      });
    });
  });
});
