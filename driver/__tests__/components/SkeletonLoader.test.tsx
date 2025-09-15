import React from 'react';
import { render } from '@testing-library/react-native';
import SkeletonLoader, { SkeletonRow, SkeletonCard } from '@/components/common/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<SkeletonLoader testID="skeleton-loader" />);
    const skeletonLoader = getByTestId('skeleton-loader');
    expect(skeletonLoader).toBeDefined();
  });

  it('applies custom width and height', () => {
    const { getByTestId } = render(
      <SkeletonLoader testID="skeleton-loader" width={100} height={50} />
    );
    const skeletonLoader = getByTestId('skeleton-loader');
    expect(skeletonLoader.props.style.width).toBe(100);
    expect(skeletonLoader.props.style.height).toBe(50);
  });

  it('applies custom border radius', () => {
    const { getByTestId } = render(
      <SkeletonLoader testID="skeleton-loader" borderRadius={10} />
    );
    const skeletonLoader = getByTestId('skeleton-loader');
    expect(skeletonLoader.props.style.borderRadius).toBe(10);
  });
});

describe('SkeletonRow Component', () => {
  it('renders the correct number of lines', () => {
    const { getAllByTestId } = render(
<<<<<<< HEAD
      <SkeletonRow lines={3} testID="skeleton-row" />
    );
    const skeletonLines = getAllByTestId(/^skeleton-line-/);
=======
      <SkeletonRow lines={3} testID="skeleton-row">
        <SkeletonLoader testID="skeleton-line" />
      </SkeletonRow>
    );
    const skeletonLines = getAllByTestId('skeleton-line');
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
    expect(skeletonLines.length).toBe(3);
  });

  it('applies custom line height and spacing', () => {
    const { getAllByTestId } = render(
      <SkeletonRow 
        lines={2} 
        lineHeight={30} 
        spacing={15} 
<<<<<<< HEAD
        testID="skeleton-row" />
    );
    const skeletonLines = getAllByTestId(/^skeleton-line-/);
=======
        testID="skeleton-row">
        <SkeletonLoader testID="skeleton-line" />
      </SkeletonRow>
    );
    const skeletonLines = getAllByTestId('skeleton-line');
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
    expect(skeletonLines[0].props.style.height).toBe(30);
    expect(skeletonLines[0].props.style.marginBottom).toBe(15);
    expect(skeletonLines[1].props.style.marginBottom).toBe(0); // Last line has no margin
  });
});

describe('SkeletonCard Component', () => {
  it('renders correctly with all elements', () => {
    const { getByTestId } = render(<SkeletonCard testID="skeleton-card" />);
    const skeletonCard = getByTestId('skeleton-card');
    expect(skeletonCard).toBeDefined();
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
