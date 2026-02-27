import Button from '@/components/button';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockOnPress = jest.fn();

beforeEach(() => {
    jest.clearAllMocks(); // reset mock between tests
});

describe('Button', () => {

    it('renders button text', () => {
        render(<Button onPress={mockOnPress}>Press me</Button>);
        expect(screen.getByText('Press me')).toBeTruthy();
    });

    it('calls onPress when tapped', () => {
        render(<Button onPress={mockOnPress}>Press me</Button>);
        fireEvent.press(screen.getByText('Press me'));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress before interaction', () => {
        render(<Button onPress={mockOnPress}>Press me</Button>);
        expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when disabled', () => {
        render(<Button onPress={mockOnPress} disabled>Press me</Button>);
        fireEvent.press(screen.getByText('Press me'));
        expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('renders correctly (snapshot)', () => {
        const tree = render(<Button onPress={mockOnPress}>Press me</Button>);
        expect(tree.toJSON()).toMatchSnapshot();
    });

});