import type { Meta, StoryObj } from '@storybook/angular';
import { TextInput } from './text-input';

const meta: Meta<TextInput> = {
  title: 'Atoms/Input/Text Input',
  component: TextInput,

  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    type: 'text',
    value: '',
    disabled: false,
    required: false,
    helperText: 'Please enter your full name.',
    errorMessage: 'This field is required.',
    successMessage: 'Looks good!',
    invalid: false,
    success: false,
    showValidation: true,
  },

  argTypes: {
    label: {
      control: 'text',
    },

    placeholder: {
      control: 'text',
    },

    value: {
      control: 'text',
    },

    helperText: {
      control: 'text',
    },

    errorMessage: {
      control: 'text',
    },

    successMessage: {
      control: 'text',
    },

    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'search',
      ],
    },

    required: {
      control: 'boolean',
    },

    disabled: {
      control: 'boolean',
    },

    invalid: {
      control: 'boolean',
    },

    success: {
      control: 'boolean',
    },

    showValidation: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<TextInput>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const Success: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    success: true,
    invalid: false,
    showValidation: true,
    successMessage: 'Email looks good!',
  },
};

export const Error: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    invalid: true,
    success: false,
    showValidation: true,
    errorMessage: 'Please enter a valid email address.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Search: Story = {
  args: {
    label: 'Search',
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: 'Enter age',
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    helperText: "We'll never share your email.",
  },
};