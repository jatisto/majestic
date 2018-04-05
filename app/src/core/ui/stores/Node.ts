import { ITreeNode, IconName } from '@blueprintjs/core';
import { observable, IObservableArray, computed } from 'mobx';
import It from './It';
import TreeNodeType from '../../../types/nodeTypes';
import CoverageSummary from './CoverageSummary';
import { FileNode } from '../../engine/types/FileNode';
import { ItBlock } from '../../engine/types/ItBlock';
import { Status } from './types/JestRepoter';

export default class Node implements ITreeNode {
  @observable childNodes?: Node[];
  @observable hasCaret?: boolean;
  @observable icon?: IconName;
  @observable id: string | number;
  @observable isExpanded?: boolean = true;
  @observable isSelected?: boolean = false;
  @observable label: string | JSX.Element;
  @observable secondaryLabel?: string | JSX.Element = '';
  @observable className?: string;
  @observable path: string;
  @observable status: Status;
  @observable output: string;
  @observable itBlocks: IObservableArray<It> = observable([]);
  @observable type: TreeNodeType;
  @observable isTest: boolean;
  @observable content: string;
  @observable coverage = new CoverageSummary();
  @observable executionTime: number = 0;

  public static convertToNode(
    { path, type, label, children, itBlocks }: FileNode,
    flatNodeMap: Map<string, Node> = new Map(),
    parent?: Node
  ) {
    const node = new Node(path, type, label, itBlocks || []);
    flatNodeMap.set(path.toLowerCase(), node);
    if (!children) {
      return {
        node,
        flatNodeMap
      };
    }

    node.childNodes = children.map(
      child => Node.convertToNode(child, flatNodeMap, node).node
    );

    return {
      node,
      flatNodeMap
    };
  }

  constructor(
    path: string,
    type: 'directory' | 'file',
    label: string,
    itBlocks: ItBlock[]
  ) {
    this.path = path;
    this.type = type;
    this.label = label;

    for (const { name } of itBlocks) {
      this.itBlocks.push(new It(name));
    }

    if (type === 'directory') {
      this.icon = 'folder-open';
    } else {
      this.icon = 'document';
    }
  }

  public toggleSelection(selection: boolean = true) {
    this.isSelected = selection;
  }

  public toggleStatus() {
    return {
      skipped: () => (this.status = 'skipped'),
      passed: () => (this.status = 'passed'),
      failed: () => (this.status = 'failed')
    };
  }

  public getItBlockByTitle(title: string) {
    return this.itBlocks.find(it => it.name === title);
  }

  @computed
  public get totalTests() {
    return this.itBlocks.length;
  }

  @computed
  public get totalPassedTests() {
    return this.itBlocks.filter(e => e.status === 'passed').length;
  }

  @computed
  public get totalFailedTests() {
    return this.itBlocks.filter(e => e.status === 'failed').length;
  }

  @computed
  public get totalSkippedTests() {
    return this.itBlocks.filter(e => e.status === 'skipped').length;
  }
}
