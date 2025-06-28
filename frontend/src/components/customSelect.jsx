import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: state.selectProps.hasError
      ? 'red'
      : state.isFocused
      ? '#a78bfa'
      : 'black',
    borderRadius: '0.305rem',
    padding: '0px 0.2rem', 
    minHeight: '41px',
    fontSize: '0.93rem',
    boxShadow: state.isFocused
      ? `0 0 0 1px ${state.selectProps.hasError ? 'red' : '#c4b5fd'}`
      : 'none',
    '&:hover': {
      borderColor: state.selectProps.hasError ? 'red' : '#a78bfa',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 4px',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: '0 px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: '0 4px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#a78bfa' : 'white',
    color: state.isSelected ? 'white' : 'black',
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: '#ddd6fe',
    },
  }),
  menu: (provided) => ({
    ...provided,
     zIndex: 9999
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, 
  }),
};

const CustomSelect = ({ options, value, onChange, placeholder, isClearable = true, hasError = false, ...rest }) => {
  return (
    <Select
      options={options}
      value={options.find(option => option.value === value) || null}
      onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
      placeholder={placeholder || "Selectează..."}
      isClearable={isClearable}
      styles={customStyles}
      menuPortalTarget={document.body}
      hasError={hasError}
  menuShouldBlockScroll={true}
  menuPosition="fixed"
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: '#ddd6fe',  
          primary: '#a78bfa',   
          primary50: '#c4b5fd', 
        },
      })}
      {...rest}
    />

  );
};

export default CustomSelect;
