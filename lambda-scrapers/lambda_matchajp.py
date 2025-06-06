import json
import os
import sys
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    AWS Lambda handler for MatchaJP scraper
    """
    try:
        logger.info("Starting MatchaJP scraper...")
        
        # Import and run your scraper
        # You'll need to modify your existing scraper to work in Lambda
        from matchajp_scraper import main as run_scraper
        
        # Run the scraper
        result = run_scraper()
        
        logger.info("MatchaJP scraper completed successfully")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'MatchaJP scraper completed successfully',
                'result': result
            })
        }
        
    except Exception as e:
        logger.error(f"Error in MatchaJP scraper: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error in MatchaJP scraper',
                'error': str(e)
            })
        }

# For local testing
if __name__ == "__main__":
    # Mock Lambda context for local testing
    class MockContext:
        function_name = "test"
        function_version = "1"
        invoked_function_arn = "test"
        memory_limit_in_mb = 512
        remaining_time_in_millis = lambda: 30000
    
    result = lambda_handler({}, MockContext())
    print(json.dumps(result, indent=2)) 