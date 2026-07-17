import { fireEvent, render } from '@testing-library/react-native';

import { OnboardingScreen } from '../OnboardingScreen';
import { ProfileFormState } from '../../types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

function makeProfileForm(overrides: Partial<ProfileFormState> = {}): ProfileFormState {
  return {
    name: '',
    trackingMode: 'cycle',
    cycleLength: '',
    periodLength: '',
    lastPeriodStart: '',
    lastPeriodEnd: '',
    addressingStyle: 'nonBinary',
    pregnancyDueDate: '',
    ...overrides,
  };
}

const noop = () => {};
const formatDateTyping = (value: string) => value;

describe('OnboardingScreen', () => {
  it('renders the intro step and moves to the next step on "Continuer"', () => {
    const onNext = jest.fn();
    const { getByText } = render(
      <OnboardingScreen
        onboardingStep={0}
        profileForm={makeProfileForm()}
        profileMessage=""
        onProfileFieldChange={noop}
        onPrevious={noop}
        onNext={onNext}
        onSave={noop}
        formatDateTyping={formatDateTyping}
      />
    );

    expect(getByText('BaddieBlood')).toBeTruthy();
    fireEvent.press(getByText('Continuer'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('lets the user fill in the profile step and reports field changes', () => {
    const onProfileFieldChange = jest.fn();
    const { getByPlaceholderText } = render(
      <OnboardingScreen
        onboardingStep={1}
        profileForm={makeProfileForm()}
        profileMessage=""
        onProfileFieldChange={onProfileFieldChange}
        onPrevious={noop}
        onNext={noop}
        onSave={noop}
        formatDateTyping={formatDateTyping}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Ex. Nadia'), 'Léa');
    expect(onProfileFieldChange).toHaveBeenCalledWith({ name: 'Léa' });
  });

  it('shows cycle settings on the last step and calls onSave', () => {
    const onSave = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <OnboardingScreen
        onboardingStep={2}
        profileForm={makeProfileForm({ addressingStyle: 'feminine' })}
        profileMessage=""
        onProfileFieldChange={noop}
        onPrevious={noop}
        onNext={noop}
        onSave={onSave}
        formatDateTyping={formatDateTyping}
      />
    );

    expect(getByPlaceholderText('Ex. 28')).toBeTruthy();
    expect(getByPlaceholderText('Ex. 5')).toBeTruthy();
    fireEvent.press(getByText(/Prêt/));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
