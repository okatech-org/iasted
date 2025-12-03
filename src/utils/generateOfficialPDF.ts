export const generateOfficialPDFWithURL = async (data: any) => {
    console.log('Generating PDF with data:', data);
    // Return a mock blob/url
    const blob = new Blob(['Mock PDF Content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return {
        blob,
        url,
        filename: `document_${Date.now()}.pdf`
    };
};
