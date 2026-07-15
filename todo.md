# PPTX Automation Hub - TODO

## Phase 1: Template Analysis & Design System
- [x] Extract template specs (dimensions, colors, fonts, positions)
- [x] Extract logo image from template
- [x] Document card layout dimensions and spacing

## Phase 2: Backend PPTX Generation
- [x] Create Python script to generate PPTX from Excel data
- [x] Replicate Technohub card layout (logo, price, names, barcode)
- [x] Implement grid arrangement (4 columns x 5 rows per slide)
- [x] Add color and font styling (red price, blue text, borders)
- [x] Test PPTX generation with sample data

## Phase 3: Frontend - Upload & Column Mapping
- [x] Build Excel file upload component with drag-and-drop
- [x] Parse Excel and display column headers
- [x] Create column mapping UI (Price, English Name, Lao Name, Barcode)
- [x] Show preview of parsed data

## Phase 4: Frontend - Live Preview & Integration
- [x] Implement live preview of sample product card
- [x] Create Start button and progress indicator
- [x] Integrate with backend PPTX generation API
- [x] Implement file download functionality

## Phase 5: Polish & Testing
- [x] Refine UI/UX for elegance and polish
- [x] Test end-to-end workflow
- [x] Verify PPTX output matches template 100%
- [x] Performance optimization

## Phase 6: Column Display Enhancement
- [x] Change column mapping UI to show Column A, B, C, D instead of header names
- [x] Update ColumnMappingUI component to use column letters
- [x] Update sample data preview to reference column letters


## Phase 7: UI Redesign - Match Technohub Template
- [x] Update Home page to show Technohub product card examples
- [x] Redesign Generator page layout to match template aesthetic
- [x] Create product card grid display (4 columns) in preview
- [x] Add Technohub branding and styling to match template
- [x] Remove step indicators for cleaner look
- [x] Fix data type conversion (Excel numbers to strings)


## Phase 8: Debug Column Mapping Issue
- [x] Fix column mapping data extraction in preview
- [x] Verify correct data is displayed from mapped columns
- [x] Test with actual Excel file to ensure data flows correctly


## Phase 9: Extract and Integrate Technohub Logo
- [ ] Extract actual Technohub logo image from template PPTX
- [ ] Upload logo to S3 for use in web app
- [ ] Update Home page product cards to use actual logo
- [ ] Update Generator preview cards to use actual logo
- [ ] Update PPTX generation to use actual logo instead of text
- [ ] Verify all cards match template 100%
