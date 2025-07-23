package com.Leaz.contract;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.stream.Collectors;

@Component
public class FileParser {

    /**
     * Dispatch based on file extension.
     */
    public String parse(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename().toLowerCase();
        if (name.endsWith(".pdf")) {
            return parsePdf(file.getInputStream());
        } else if (name.endsWith(".docx")) {
            return parseDocx(file.getInputStream());
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + name);
        }
    }

    /**
     * Extract text from PDF via PDFBox.
     */
    private String parsePdf(InputStream in) throws IOException {
        try (PDDocument doc = PDDocument.load(in)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    /**
     * Extract text from DOCX via Apache POI.
     */
    private String parseDocx(InputStream in) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(in)) {
            return doc.getParagraphs()
                      .stream()
                      .map(XWPFParagraph::getText)
                      .collect(Collectors.joining("\n"));
        }
    }
}
