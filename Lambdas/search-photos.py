#lambda search function
import json
import os
import math
import dateutil.parser
import datetime
import time
import logging
import boto3
import requests
import inflect

def get_slots(intent_request):
    print('AWS Code Pipeline Testing')
    return intent_request['currentIntent']['slots']

def close(session_attributes, fulfillment_state, message):
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }
    
    return response

    
def lambda_handler(event, context):
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    client = boto3.client('lex-runtime')
    print("Event",event)
    
    response_lex = client.post_text(
    botName='Photo',
    botAlias="PhotoAlias",
    userId="test",
    inputText= event['queryStringParameters']['q'])
    
    print("response_lex",response_lex)
    if 'slots' in response_lex:
        keys = [response_lex['slots']['slotOne'],response_lex['slots']['slotTwo']]
        pictures = search_intent(keys) #get images keys from elastic search labels
        response = {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"},
            "body": json.dumps(pictures),
            "isBase64Encoded": False
        }
    else:
        response = {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"},
            "body": [],
            "isBase64Encoded": False}
    print(response)
    return response
    
def dispatch(intent_request):
    intent_name = intent_request['currentIntent']['name']
    return search_intent(intent_request)

    raise Exception('Intent with name ' + intent_name + ' not supported')

def search_intent(labels):
    p = inflect.engine()
    url = 'https://search-photos-uyhb4sgvhvdnc7kklvhnoppgsm.us-east-1.es.amazonaws.com/photos/_search?q='
    resp = []
    for label in labels:
        if (label is not None) and label != '':
            if label == p.singular_noun(label):
                label2 = p.plural(label)
                print('label2 : ', label2)
                url2 = url + label2
                print('url2 : ', url2)
                resp.append(requests.get(url2,auth=('yb2145', 'Test1234#')).json())
                url2 = url + label
                print('url2 : ', url2)
                resp.append(requests.get(url2,auth=('yb2145', 'Test1234#')).json())
            
            else:
                label1 = p.singular_noun(label)
                print('label1 : ', label1)
                url2 = url+label1
                print('url2 : ', url2)
                resp.append(requests.get(url2,auth=('yb2145', 'Test1234#')).json())
                url2 = url + label
                print('url2 : ', url2)
                resp.append(requests.get(url2,auth=('yb2145', 'Test1234#')).json())
                
    print (resp)
  
    output = []
    for r in resp:
        if 'hits' in r:
             for val in r['hits']['hits']:
                key = val['_source']['objectKey']
                if key not in output:
                    print(key)
                    output.append(key)
    print(output)
    return output