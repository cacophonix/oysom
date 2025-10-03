const { execSync } = require('child_process');
require('dotenv').config();

async function clearDatabase() {
  console.log('🔄 Starting database cleanup and reseed process...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment variables');
  }

  try {
    console.log('🗑️  Clearing all data from database...');
    
    // Use a safe approach that dynamically finds and clears existing tables
    const clearCommand = `psql "${databaseUrl}" -c "
      DO \\$\\$ 
      DECLARE 
          r RECORD;
      BEGIN
          -- Clear data from all tables in public schema
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
          LOOP
              BEGIN
                  EXECUTE 'DELETE FROM ' || quote_ident(r.tablename);
                  RAISE NOTICE 'Cleared table: %', r.tablename;
              EXCEPTION 
                  WHEN others THEN 
                      RAISE NOTICE 'Could not clear table %, error: %', r.tablename, SQLERRM;
              END;
          END LOOP;
      END \\$\\$;
    "`;
    
    console.log('🗑️  Executing database cleanup...');
    execSync(clearCommand, { stdio: 'inherit' });
    
    console.log('✅ Database cleared successfully!');
    
    // Small delay to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now run the seed script
    console.log('🌱 Running seed script...');
    execSync('npx medusa exec ./src/scripts/seed.ts', { 
      stdio: 'inherit', 
      cwd: __dirname,
      env: { ...process.env }
    });
    
    console.log('✅ Database seeding completed successfully!');
    console.log('🎉 Fresh data has been created following medusa-sample patterns!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup and seeding:', error.message);
    
    // Provide helpful debugging information
    if (error.message.includes('psql')) {
      console.error('💡 Make sure PostgreSQL is installed and accessible via psql command');
      console.error('💡 Check that DATABASE_URL is correctly formatted');
    }
    
    if (error.message.includes('medusa')) {
      console.error('💡 Make sure you are running this from the medusa project directory');
      console.error('💡 Make sure medusa dependencies are installed (npm install)');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Process terminated. Exiting gracefully...');
  process.exit(0);
});

clearDatabase().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
