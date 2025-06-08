# Use Microsoft's official Playwright image with Python
FROM mcr.microsoft.com/playwright/python:v1.51.0-noble

# Set function directory
ARG LAMBDA_TASK_ROOT="/var/task"
WORKDIR ${LAMBDA_TASK_ROOT}

# Install AWS Lambda runtime dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Install AWS Lambda Runtime Interface Client
RUN pip install awslambdaric

# Copy requirements and install Python dependencies
COPY requirements_prisma.txt ${LAMBDA_TASK_ROOT}/
RUN pip install -r requirements_prisma.txt

# Copy the function code
COPY lambda_function_prisma.py ${LAMBDA_TASK_ROOT}/lambda_function.py

# Set the CMD to your handler
ENTRYPOINT [ "python", "-m", "awslambdaric" ]
CMD [ "lambda_function.lambda_handler" ] 