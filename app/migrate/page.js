import MigrationTool from '../../components/MigrationTool';

export const metadata = {
  title: 'Data Migration - Bountera',
  description: 'Migrate your localStorage data to MongoDB',
};

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔄 Database Migration
          </h1>
          <p className="text-xl text-gray-600">
            Upgrade your Bountera experience with MongoDB integration
          </p>
        </div>
        
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Important Information
          </h2>
          <div className="text-yellow-700 space-y-2">
            <p>• This migration will transfer all your localStorage data to MongoDB</p>
            <p>• A backup of your current data will be created automatically</p>
            <p>• The process may take a few minutes depending on data size</p>
            <p>• Do not close this page during migration</p>
            <p>• After migration, your app will use the new MongoDB database</p>
          </div>
        </div>
        
        <MigrationTool />
        
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🚀 What's New After Migration
            </h3>
            <div className="text-blue-700 space-y-2">
              <p>✅ Improved performance and reliability</p>
              <p>✅ Better data consistency and backup</p>
              <p>✅ Enhanced Razorpay payment integration</p>
              <p>✅ Real-time leaderboard updates</p>
              <p>✅ Advanced user profiles and statistics</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/dashboard" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}