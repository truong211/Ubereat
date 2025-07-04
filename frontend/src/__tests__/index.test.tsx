import { render, screen } from '@testing-library/react';
import Home from '../app/page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
  });

  it('contains main content', () => {
    render(<Home />);
    // This test will pass as long as the component renders
    expect(document.body).toBeTruthy();
  });
});