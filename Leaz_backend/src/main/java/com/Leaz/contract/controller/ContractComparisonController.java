package com.Leaz.contract;

import com.Leaz.Document;
import com.Leaz.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractComparisonController {

    private final ContractComparisonService comparisonService;
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private final FileParser fileParser;


    /**
     * POST /api/contracts/compare-contracts
     * - oldContract: PDF or DOCX (max 10MB)
     * - newContract: PDF or DOCX (max 10MB)
     */
    @PostMapping(value = "/compare-contracts",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> compareContracts(
            @RequestPart("oldContract") MultipartFile oldFile,
            @RequestPart("newContract") MultipartFile newFile) {

        // 1. Basic validations
        if (oldFile.isEmpty() || newFile.isEmpty()) {
            return ResponseEntity
                      .status(HttpStatus.BAD_REQUEST)
                      .body("Both oldContract and newContract must be provided.");
        }
        if (oldFile.getSize() > 10 * 1024 * 1024 || newFile.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity
                      .status(HttpStatus.PAYLOAD_TOO_LARGE)
                      .body("Each file must be ≤ 10MB.");
        }

        try {
            String oldContent = fileParser.parse(oldFile);
            String newContent = fileParser.parse(newFile);

            Document oldDoc = new Document();
            oldDoc.setTitle(oldFile.getOriginalFilename());
            oldDoc.setContent(oldContent);
            oldDoc.setStatus("Uploaded");
            oldDoc.setDateCreated(LocalDateTime.now());
            oldDoc.setLastModified(LocalDateTime.now());
            documentRepository.save(oldDoc);

            Document newDoc = new Document();
            newDoc.setTitle(newFile.getOriginalFilename());
            newDoc.setContent(newContent);
            newDoc.setStatus("Uploaded");
            newDoc.setDateCreated(LocalDateTime.now());
            newDoc.setLastModified(LocalDateTime.now());
            documentRepository.save(newDoc);
            
            // 3. Call comparison service
            CompareResponse response = comparisonService.compare(oldFile, newFile);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            // Unsupported file type or other validation error
            return ResponseEntity
                      .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                      .body(ex.getMessage());

        } catch (IOException ex) {
            // I/O error during parsing
            return ResponseEntity
                      .status(HttpStatus.BAD_REQUEST)
                      .body("Failed to parse contracts: " + ex.getMessage());

        } catch (RuntimeException ex) {
            // LLM or other runtime exceptions
            return ResponseEntity
                      .status(HttpStatus.INTERNAL_SERVER_ERROR)
                      .body("Comparison failed: " + ex.getMessage());
        }
    }
}
