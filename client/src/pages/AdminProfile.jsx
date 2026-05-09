import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  IconButton
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MainCard from "components/MainCard";
import API from "api/axios";
import { getAssetUrl } from "utils/assetUrl";
import { emailRegex, isBlank, validateImageFile } from "utils/validation";
import toast from "react-hot-toast";

export default function AdminProfile({ page }) {
  const [edit, setEdit] = useState(false);
  const fileInputRef = useRef();

  const [admin, setAdmin] = useState({
    fullName: "",
    email: "",
    password: "",
    image: "",
    createdAt: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Sync edit mode with route
  useEffect(() => {
    setEdit(page !== "view");
  }, [page]);

  // ✅ Fetch profile
  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/admin/profile");

      setAdmin({
        fullName: data.fullName,
        email: data.email,
        image: data.image,
        createdAt: data.createdAt,
        password: ""
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Handle image upload (preview + store file)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageError = validateImageFile(file);
      if (imageError) {
        setErrors((prev) => ({ ...prev, image: imageError }));
        toast.error(imageError);
        e.target.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, image: "" }));
      setSelectedFile(file);

      const preview = URL.createObjectURL(file);
      setAdmin((prev) => ({ ...prev, image: preview }));
    }
  };

  // ✅ Save profile
  const handleSave = async () => {
    try {
      const nextErrors = {};
      if (isBlank(admin.fullName)) nextErrors.fullName = "Full name is required";
      if (!emailRegex.test(admin.email)) nextErrors.email = "Enter a valid email";
      if (admin.password && admin.password.length < 6) nextErrors.password = "Password must be at least 6 characters";

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        toast.error("Please fix the highlighted fields");
        return;
      }

      const formData = new FormData();

      formData.append("fullName", admin.fullName);
      formData.append("email", admin.email);

      if (admin.password) {
        formData.append("password", admin.password);
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const { data } = await API.put("/admin/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setAdmin({
        fullName: data.fullName,
        email: data.email,
        image: data.image,
        createdAt: data.createdAt,
        password: ""
      });

      localStorage.setItem("adminInfo", JSON.stringify(data));

      setSelectedFile(null);
      setEdit(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  // ✅ Cancel edit (reload data)
  const handleCancel = async () => {
    await fetchProfile();
    setSelectedFile(null);
    setEdit(false);
  };

  // ✅ Logout (replace delete for now)
  const handleDelete = async () => {
    try {
      await API.post("/admin/logout");
      localStorage.removeItem("adminInfo");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainCard>
      {/* ===== Profile Header ===== */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={
              admin.image ? getAssetUrl(admin.image) : ""
            }
            sx={{ width: 90, height: 90, mx: "auto", mb: 1 }}
          >
            {!admin.image && admin.fullName?.charAt(0)}
          </Avatar>

          {edit && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: 5,
                right: 5,
                bgcolor: "white",
                boxShadow: 2
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <CameraAltIcon fontSize="small" />
            </IconButton>
          )}

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
          />
          {errors.image && <Typography color="error" variant="caption">{errors.image}</Typography>}
        </Box>

        <Typography variant="h5">{admin.fullName}</Typography>
        <Typography color="text.secondary">{admin.email}</Typography>

        {/* ===== Buttons ===== */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          {!edit ? (
            <>
              <Button variant="contained" onClick={() => setEdit(true)}>
                Edit Profile
              </Button>

              <Button color="error" variant="outlined" onClick={handleDelete}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>

              <Button onClick={handleCancel}>Cancel</Button>
            </>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ===== Account Info ===== */}
      <Paper sx={{ p: 3, width: "80%", margin: "auto" }}>
        <Typography variant="subtitle1" mb={2}>
          Account Info
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Full Name"
            fullWidth
            value={admin.fullName}
            disabled={!edit}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            onChange={(e) =>
              setAdmin({ ...admin, fullName: e.target.value })
            }
          />

          <TextField
            label="Email"
            fullWidth
            value={admin.email}
            disabled={!edit}
            error={Boolean(errors.email)}
            helperText={errors.email}
            onChange={(e) =>
              setAdmin({ ...admin, email: e.target.value.trim().toLowerCase() })
            }
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            placeholder="Enter new password"
            disabled={!edit}
            value={admin.password}
            error={Boolean(errors.password)}
            helperText={errors.password}
            onChange={(e) =>
              setAdmin({ ...admin, password: e.target.value })
            }
          />
        </Stack>
      </Paper>
    </MainCard>
  );
}
