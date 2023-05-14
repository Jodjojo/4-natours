/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// to update user password it will resemble this function so we refactor our code to have a handler function that will update the user data and its settings
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : `/api/v1/users/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.toUpperCase()} has been successfully updated!`
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // console.log(err.response.data.message);
  }
};
