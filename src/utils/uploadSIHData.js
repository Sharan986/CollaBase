import { uploadProblemStatements, isCollectionEmpty } from '../services/sihServiceNew.js';
import problemStatementsData from '../data/sihProblemStatements.json';

/**
 * Manual upload utility for SIH 2025 Problem Statements
 * Run this script to upload all 101 problem statements to Firebase
 */

const uploadSIHData = async () => {
  try {
    console.log('🚀 Starting SIH 2025 data upload...');
    console.log(`📊 Total problem statements to upload: ${problemStatementsData.length}`);

    // Check if collection already has data
    const isEmpty = await isCollectionEmpty();
    if (!isEmpty) {
      console.log('⚠️ Warning: Collection already contains data!');
      console.log('💡 This will add duplicate entries. Continue? (Ctrl+C to cancel)');
      
      // Wait 3 seconds before proceeding
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Upload data
    const result = await uploadProblemStatements(problemStatementsData);
    
    if (result.success) {
      console.log('✅ Upload completed successfully!');
      console.log(`📈 ${result.message}`);
      
      // Show some statistics
      const stats = {
        total: problemStatementsData.length,
        software: problemStatementsData.filter(p => p.category === 'Software').length,
        hardware: problemStatementsData.filter(p => p.category === 'Hardware').length,
        uniqueThemes: [...new Set(problemStatementsData.map(p => p.theme))].length,
        uniqueOrganizations: [...new Set(problemStatementsData.map(p => p.organization))].length
      };
      
      console.log('\n📊 Upload Statistics:');
      console.log(`   📋 Total: ${stats.total}`);
      console.log(`   💻 Software: ${stats.software}`);
      console.log(`   🔧 Hardware: ${stats.hardware}`);
      console.log(`   🎯 Themes: ${stats.uniqueThemes}`);
      console.log(`   🏢 Organizations: ${stats.uniqueOrganizations}`);
      
    } else {
      console.error('❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
  }
};

// Export for manual execution
export { uploadSIHData };

// Auto-execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadSIHData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}
