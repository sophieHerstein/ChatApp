package de.sophieherstein.chat_app_backend.file;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import de.sophieherstein.chat_app_backend.exceptions.InvalidProfileImageException;
import de.sophieherstein.chat_app_backend.exceptions.ProfileImageStorageException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageStorageService {

    private static final Path UPLOAD_DIR = Path.of("uploads/profile-images");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public String store(MultipartFile file) {
        validate(file);

        try {
            Files.createDirectories(UPLOAD_DIR);

            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;

            Path targetPath = UPLOAD_DIR.resolve(filename);
            file.transferTo(targetPath);

            return "/uploads/profile-images/" + filename;
        } catch (IOException ex) {
            throw new ProfileImageStorageException(ex);
        }
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidProfileImageException("Profile image is empty");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new InvalidProfileImageException(
                    "Only JPEG, PNG and WEBP images are allowed"
            );
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new InvalidProfileImageException(
                    "Profile image must be smaller than 2 MB"
            );
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }

        return filename.substring(filename.lastIndexOf("."));
    }
}