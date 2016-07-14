import assert = require('assert');
import sinon = require('sinon');

import { MavensMateClient, Options } from '../../src/mavensmate/mavensMateClient';
import { MavensMateStatus } from '../../src/vscode/mavensMateStatus';
import ProjectQuickPick = require('../../src/vscode/projectQuickPick');
import { CommandInvoker } from '../../src/mavensmate/commandInvoker';
import ClientCommands = require('../../src/mavensmate/clientCommands');
import vscode = require('vscode');
import { TestExtensionContext } from './testExtensionContext';

import { CommandRegistrar } from '../../src/vscode/commandRegistrar';

let clientOptions: Options = null;
let client = MavensMateClient.Create(clientOptions);
let status = MavensMateStatus.Create(client);
let context : vscode.ExtensionContext = new TestExtensionContext();
let command1 = { command: '1' };
let command2 = { command: '2' };
let commandList = {
    'command1': command1,
    'command2': command2
};
let commandInvoker1 = CommandInvoker.Create(null, null, command1);
let commandInvoker2 = CommandInvoker.Create(null, null, command2);
let commandRegistration1 = new vscode.Disposable(() => {});
let commandRegistration2 = new vscode.Disposable(() => {});
let commandRegistration3 = new vscode.Disposable(() => {});

let commandRegistrar : CommandRegistrar = CommandRegistrar.Create(client, status, context);

suite('commandRegistrar', () => {
    let commandListStub : sinon.SinonStub;
    let createInvokerStub : sinon.SinonStub;
    let registerCommandStub : sinon.SinonStub;
    let subscriptionPushStub : sinon.SinonStub;

    setup(() => {
        commandListStub = sinon.stub(ClientCommands, 'list').returns(commandList);
        createInvokerStub = sinon.stub(CommandInvoker, 'Create');
        createInvokerStub.withArgs(client, status, command1).returns(commandInvoker1);
        createInvokerStub.withArgs(client, status, command2).returns(commandInvoker2);
        registerCommandStub = sinon.stub(vscode.commands, 'registerCommand');
        registerCommandStub.onFirstCall().returns(commandRegistration1);
        registerCommandStub.onSecondCall().returns(commandRegistration2);
        registerCommandStub.onThirdCall().returns(commandRegistration3);
    });

    teardown(() => {
        commandListStub.restore();
        createInvokerStub.restore();
        registerCommandStub.restore();
    });

    test('registerCommands', () => {
        commandRegistrar.registerCommands();

        sinon.assert.calledOnce(commandListStub);
        sinon.assert.calledTwice(createInvokerStub);
        sinon.assert.calledWith(createInvokerStub ,client, status, command1);
        sinon.assert.calledWith(createInvokerStub ,client, status, command2);
        sinon.assert.calledThrice(registerCommandStub);
        sinon.assert.calledWith(registerCommandStub, 'command1', commandInvoker1.invokeProxy);
        sinon.assert.calledWith(registerCommandStub, 'command2', commandInvoker2.invokeProxy);
        sinon.assert.calledWith(registerCommandStub, 'mavensmate.openProject', ProjectQuickPick.showProjectListAndOpen);
    });
});