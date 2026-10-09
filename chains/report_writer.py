from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def write_report(topic, summaries):
    prompt = f"""
You are an expert research analyst.

Write a professional research report on the topic:

{topic}

Using the following research summaries:

{summaries}

The report must include:

# Research Report

## Executive Summary

## Introduction

## Key Concepts

## Applications

## Advantages

## Challenges

## Future Trends

## Conclusion

## References
(List references if available.)

Requirements:
- Use Markdown headings
- Write in a professional style
- Use bullet points where appropriate
- Keep the report around 1000–1500 words
"""

    response = client.chat.completions.create(
        model="gpt-5-nano",
        messages=[
            {
                "role": "system",
                "content": "You are an expert research report writer."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content